import Connexion from '@/components/connexion'
import ProjectsHub from '@/components/projects-hub'
import Project from '@/components/project'

export default
{
    name: 'application',

    components:
    {
        Connexion,
        ProjectsHub,
        Project
    },

    computed:
    {
        project()
        {
            return this.$store.state.projects.current
        }
    },

    mounted()
    {
        this.testScrollbar()
    },

    methods:
    {
        testScrollbar()
        {
            // Create dummy
            const dummy = document.createElement("div")

            dummy.style.width = '100px'
            dummy.style.height = '100px'
            dummy.style.overflow = 'scroll'
            dummy.style.position = 'absolute'
            dummy.style.top = '-9999px'

            this.$el.appendChild(dummy)

            // Get the scrollbar width
            const scrollbarWidth = dummy.offsetWidth - dummy.clientWidth
            this.$store.commit('updateScrollbarWidth', scrollbarWidth)

            // Delete the DIV
            this.$el.removeChild(dummy)
        },

        onHeaderClick()
        {
            this.$store.commit('setFile', null)
        }
    }
}